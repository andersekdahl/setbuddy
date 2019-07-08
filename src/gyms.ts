import { select, registerMigration } from './db';

function getAllGyms() {
  return select('SELECT * FROM gyms', []);
}
