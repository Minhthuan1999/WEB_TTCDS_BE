const db = require("../database/db");

class Gallery {
  get() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT
            albums.*,
            COUNT(distinct photos.photo_id) AS photo_count,
            cover_photo.photo_url AS cover_photo_url,
            cover_photo.photo_name AS cover_photo_name,
            cover_photo.filename AS cover_photo_filename
        FROM albums
        LEFT JOIN photos ON albums.album_id = photos.album_id
        LEFT JOIN photos AS cover_photo ON albums.cover_photo_id = cover_photo.photo_id
        GROUP BY albums.album_id, albums.album_name, cover_photo_url, cover_photo_name, cover_photo_filename;`,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT albums.album_id, albums.album_name, albums.cover_photo_id, albums.created_at, photos.photo_id, photos.photo_url, photos.filename, photos.photo_size, photos.photo_name FROM albums LEFT JOIN photos ON albums.album_id = photos.album_id WHERE albums.album_id = ?",
        id,
        (error, results) => {
          if (error) reject(error);
          else {
            if (results.length === 0) {
              resolve(null);
            } else {
              const info = {
                ...results[0],
                photos: results
                  .filter((row) => row.album_id)
                  .map((row) => ({
                    photo_id: row.photo_id,
                    photo_url: row.photo_url,
                    filename: row.filename,
                    file_size: row.photo_size,
                    photo_name: row.photo_name,
                  })),
              };
              resolve(info);
            }
          }
        }
      );
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO albums SET ?", data, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  async setCover(albumId, photoId) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE albums SET cover_photo_id = ? WHERE album_id = ?",
        [photoId, albumId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  async rename(id, name) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE albums SET ? WHERE album_id = ?",
        [name, id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM albums WHERE album_id = ?",
        [id],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

//photo db
class Photo {
  get() {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM photos", (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM photos WHERE album_id = ?",
        id,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  upload(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO photos SET ?", data, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  delete(Ids) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM photos WHERE filename IN (?)",
        [Ids],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }
}

class Video {
  get() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM videos INNER JOIN users ON videos.userID = users.userID",
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM videos WHERE id = ?", id, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
      });
    });
  }

  getByPriority() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM videos WHERE priority > 0 ORDER BY priority ASC LIMIT 3",
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  }

  upload(data) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO videos SET ?", data, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM videos WHERE id = ?",
        [id],
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });
  }

  async update(id, data) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE videos SET ? WHERE id = ?', [data, id], (error, result) => {
        if (error) reject(error);
        resolve(result)
      })
    })
  }
}

module.exports = {
  Album: new Gallery(),
  Photo: new Photo(),
  Video: new Video(),
};
