'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('regions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
    await queryInterface.bulkInsert('regions', [
      { name: 'Tigray' },
      { name: 'Afar' },
      { name: 'Amhara' },
      { name: 'Oromia' },
      { name: 'Somali' },
      { name: 'Benishangul-Gumuz' },
      { name: 'SNNPR' },
      { name: 'Gambella' },
      { name: 'Harari' },
      { name: 'Sidama' },
      { name: 'South West Ethiopia Peoples\' Region' },
      { name: 'Addis Ababa' },
      { name: 'Dire Dawa' },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('regions');
  },
};