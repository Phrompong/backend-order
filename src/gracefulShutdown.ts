import { Request, Response } from "express";
import * as http from "http";
import { Socket } from "net";
import container from "./inversify.config";
import IState from "./interfaces/state.interface";
import { TYPES } from "./types";
/**
 * Copyright 2020 Dashlane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * Helper function to allow better handling of keep-alive connections for
 * graceful termination of a server. Calling `server.close()` will stop the server
 * from accepting new connections, but existing keep-alive aren't closed nor handled
 * in any special way by default. https://github.com/nodejs/node/issues/2642 shows
 * that this can keep a server for being shutdown cleanly after serving ongoing requests.
 *
 * This function will keep track of all opened connections and ongoing requests.
 *
 * The main idea is trying to serve all ongoing requests before shutting down the
 * server while trying to minimize the "socket hangup" or "connection reset"
 * errors on clients.
 *
 * Once the server starts being terminated, the server will reply with
 * Connection: close headers to signal clients not to send requests on existing
 * connections because they will be closed. This is done to minimize the chance
 * of closing a connection while there is an in-flight request to the server.
 *
 * All connections for which a Connection: close response has been sent, will be
 * terminated after handling the last request.
 *
 * After a timeout, all idle connections with no ongoing requests will be closed,
 * even if they haven't received the Connection: close header.
 *
 * After a bigger timeout, if some connections are still keeping the server
 * open, all connections will be forced closed and ongoing requests will not
 * send a response.
 */
// If the server needs to be stopped and it seems to be having trouble keeping up with pending requests
// we should just force the closing of the connections

let forcedStopTimeout = 30000;

// In cases a client is sending no more requests, we won't have the opportunity to send Connection: close back
// In these cases we should just end the connection as it has become idle.
// Note that this could be achieved internally with server.keepAliveTimeout but
// the normal runtime value might be different for what we'd like here
let timeoutToTryEndIdle = 15000;

// We need to keep track of requests per connection so that we can detect when we have responded
// to a request in a keep-alive connection. This is the only way in node that we can close a
// keep-alive connection after handling requests.
const reqCountPerSocket = new Map();
let terminating = false;

const state = container.get<IState>(TYPES.State);

const serverStoppingHelper = (server: http.Server): void => {
  // To minimize the chances of closing a connection while there is a request in-flight from the client
  // we respond with a Connection: close header once the server starts being terminated. We'll only
  // immediately close connections where we have responded this header. For others, we'll only
  // close them if they're still open after "timeoutToTryEndIdle"
  // This won't help against clients that don't respect the Connection: close header
  const hasRepliedClosedConnectionForSocket = new WeakMap();

  const trackConnections = (socket: Socket) => {
    reqCountPerSocket.set(socket, 0);
    socket.once("close", () => {
      reqCountPerSocket.delete(socket);
    });
  };

  const checkAndCloseConnection = (req: Request) => {
    const pendingRequests = reqCountPerSocket.get(req.socket) - 1;
    const hasClosingConnection = hasRepliedClosedConnectionForSocket.get(
      req.socket
    );

    reqCountPerSocket.set(req.socket, pendingRequests);

    // eslint-disable-next-line no-console
    // console.log("pendingRequests", pendingRequests);

    // eslint-disable-next-line no-console
    // console.log("hasClosingConnection", hasClosingConnection);

    /* istanbul ignore else */
    if (terminating && pendingRequests === 0 && hasClosingConnection) {
      req.socket.end();
    }
  };

  const trackRequests = (req: Request, res: Response) => {
    // * Increment current requests per connection socket
    const currentCount = reqCountPerSocket.get(req.socket);
    reqCountPerSocket.set(req.socket, currentCount + 1);

    /* istanbul ignore else */
    if (terminating && !res.headersSent) {
      res.setHeader("connection", "close");
      hasRepliedClosedConnectionForSocket.set(req.socket, true);
    }

    res.on("finish", () => {
      checkAndCloseConnection(req);
    });
  };

  // * Track connections
  server.on("connection", (socket) => {
    trackConnections(socket);
  });

  // * Track requests
  server.on("request", trackRequests);
};

const endAllConnections = ({ force }: { force: boolean }) => {
  for (const [socket, reqCount] of reqCountPerSocket) {
    if (force || reqCount === 0) {
      socket.end();
    }
  }
};

const stoppingFunction = async (): Promise<void> => {
  terminating = true;
  try {
    await Promise.race([
      setTimeout(
        () => endAllConnections({ force: false }),
        timeoutToTryEndIdle
      ),
      setTimeout(() => endAllConnections({ force: true }), forcedStopTimeout),
    ]);
  } catch (error) /* istanbul ignore next */ {
    if (error instanceof Error) {
      state.logger.error(`Can't connect to database: ${error.message}`);
    }

    throw error;
  }
};

const setForceTimeout = (timeout: number): void => {
  forcedStopTimeout = timeout;
};

const setIdleTimeout = (timeout: number): void => {
  timeoutToTryEndIdle = timeout;
};

export {
  serverStoppingHelper,
  stoppingFunction,
  reqCountPerSocket,
  setForceTimeout,
  setIdleTimeout,
};
