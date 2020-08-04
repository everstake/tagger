exports.up = knex => {
  return knex.raw(`
    CREATE TABLE backup
    (
      "id"    varchar     DEFAULT NULL,
      "slot"    integer     DEFAULT NULL,
      primary key ("id")
    );

    INSERT INTO backup (id, slot) VALUES ('current', 0);
  `);
};

exports.down = knex => {
  return knex.schema.dropTableIfExists('backup');
};
