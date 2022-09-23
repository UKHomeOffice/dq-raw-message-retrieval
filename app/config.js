'use strict'

/* eslint no-process-env: 0 */
/* eslint no-inline-comments: 0 */
/* eslint camelcase: 0 */

module.exports = {
  pg: {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'test',
    password: process.env.PGPASSWORD || '',
    port: process.env.PGPORT || 5432
  }
}
