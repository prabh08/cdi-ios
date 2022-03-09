'use strict';
import {openDatabase} from 'react-native-sqlite-storage';
import {generateValues} from './database-queries';

var databaseName = 'rpmData.db';

let connection = openDatabase(
	{
		name: databaseName,
		location: 'default',
	},
	() => {},
	(error) => {
		console.log(error);
	},
);

class Database {
	getConnection = () => {
		return connection;
	};

	executeQuery = async (sql, params = []) =>
		new Promise((resolve, reject) => {
			connection.transaction((tnx) => {
				tnx.executeSql(
					sql,
					params,
					(transaction, results) => {
						resolve(results);
					},
					(error) => {
						reject(error);
					},
				);
		});
	});

	executeInsertQuery = (sql, values, queryFor) =>
		new Promise((resolve, reject) => {	
			// const params = generateValues(values);
			// console.log('sqlQuery: ', sql);
			connection.transaction((tnx) => {
				// const res = this.executeCreateTableQuery(queryFor);
				// if (res) {
					tnx.executeSql(
						sql,
						[],
						(transaction, results) => {
							resolve(results);
						},
						(error) => {
							reject(error);
						},
					);
				// }
			});
		});

	executeCreateTableQuery = async (tableName) => {
		let query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName.toString()}'`;
		connection.transaction((tnx) => {
			tnx.executeSql(
				query,
				[],
				(tx, res) => {
					if (res.rows.length === 0) {
						tnx.executeSql(`DROP TABLE IF EXISTS ${tableName.toString()}`, []);
						tnx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName}(data)`, []);
						return true;
					}
				},
				() => {
					return false;
				},
			);
		});
	};
}

module.exports = new Database();
