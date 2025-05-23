#!/bin/sh
set -e

cat <<EOF > /usr/share/nginx/html/config.js
window.env = {
  VITE_API_HOST: "${VITE_API_HOST}",
  VITE_API_LB_TYPE: "${VITE_API_LB_TYPE}",
  VITE_API_PORT: "${VITE_API_PORT}"
};
EOF

echo "Árbol de archivos del contenedor:"
tree /