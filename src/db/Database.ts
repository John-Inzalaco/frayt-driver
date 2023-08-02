import { Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import migrations from './Migrations';

export default class Database {
  migrationId: number;
  connection: Promise<SQLiteDatabase>;

  constructor() {
    SQLite.DEBUG(false);
    SQLite.enablePromise(true);

    this.migrationId = -1;
    this.connection = this.open();
  }

  updateMigrationId(id: number) {
    this.migrationId = id;
    AsyncStorage.setItem('migrationId', id.toString());
  }

  init() {
    SQLite.DEBUG(false);
    SQLite.enablePromise(true);
    this.open();
  }

  open(): Promise<SQLiteDatabase> {
    let db;
    return new Promise(async (resolve) => {
      SQLite.echoTest()
        .then(async () => {
          let openPromise;

          if (Platform.OS === 'ios') {
            openPromise = SQLite.openDatabase({
              name: 'frayt-driver.db',
              location: 'default',
            });
          } else {
            openPromise = SQLite.openDatabase('fraytDriver.db', '1.0');
          }

          db = await openPromise;
          // await this.drop(db);
          await this.build(db);
          resolve(db);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  close() {
    this.db
      .then((db) => db.close())
      .catch((error) => {
        console.warn('Received error: ', error);
      });
  }

  build(db) {
    return new Promise(async (resolve) => {
      this.migrationId = (await AsyncStorage.getItem('migrationId')) || 0;
      const keys = Object.keys(migrations);
      for (let mId in migrations) {
        if (migrations.hasOwnProperty(mId)) {
          if (parseInt(mId) > parseInt(this.migrationId)) {
            let migration = migrations[mId];

            db.transaction((tx) => tx.executeSql(migration))
              .then(() => {
                console.log(`Ran migration ${mId}`);
                this.updateMigrationId(mId);
                if (mId === keys[keys.length - 1]) {
                  resolve(true);
                }
              })
              .catch((err) => {
                console.warn(`Error runnning migration ${mId}:`, err);
                if (err.message.match(/^duplicate/g)) {
                  this.updateMigrationId(mId);
                }
                resolve(false);
              });
          } else {
            resolve(true);
          }
        }
      }
    });
  }

  drop(db) {
    return new Promise(async (resolve) => {
      this.updateMigrationId('0');
      db.transaction((tx) => {
        tx.executeSql('DROP TABLE Matches;')
          .then(() => {
            console.log(`Dropped DB succesfully`);
            resolve(true);
          })
          .catch((err) => {
            console.warn(`Error dropping DB:`, err);
            resolve(false);
          });
      });
    });
  }
}

export const DBConn = new Database().connection;
