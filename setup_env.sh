#!/bin/bash
bash -c "echo MAX_CLUSTERS='$MAX_CLUSTERS' >> .env"
bash -c "echo SECRET='$SECRET' >> .env"
bash -c "echo PORT='$PORT' >> .env"
bash -c "echo CONNECTION_STRING='$CONNECTION_STRING' >> .env"
bash -c "echo DATABASE_NAME='$DATABASE_NAME' >> .env"
bash -c "echo ELASTIC_URI='$ELASTIC_URI' >> .env"
