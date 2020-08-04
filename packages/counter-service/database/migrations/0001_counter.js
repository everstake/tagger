exports.up = knex => {
  return knex.raw(`
    CREATE TABLE counters
    (
      "owner"   varchar         NOT NULL,
      "label"   varchar         NOT NULL,
      "id"      varchar         NOT NULL,
      "count"   integer         DEFAULT 0,
      primary key ("owner", "label", "id")
    )
  `);
};

exports.down = knex => {
  return knex.schema.dropTableIfExists('counters');
};
