const User = require('../models/User.js');
const db = require('../db');

const UserController = {};

/**
* Add User
* @requires userId - to be present in req.body
* @argument recent_post_id - optional in req.body
* @description - creates a new User and saves to DB
*/
UserController.addNewUser = (req, res, next) => {
  if (!req.body.userId) return res.status(400).send({ err: 'Invalid request' });

  const newUser = new User(req.body.userId);

  const query = {
    text: "INSERT INTO \"Users\"(user_id, recent_post_id) VALUES($1, $2) RETURNING user_id",
    values: Object.values(newUser)
  };

  db.conn.one(query)
    .then(createdUser => {
      res.status(200).send({
        'msg': 'user successfully created',
        'uid': createdUser.user_id
      })
    })
    .catch(err => res.status(404).send(err));
};

/**
* Get User
* @param {id} - required, varchar, unique
* @description - returns table row for matching user id param.  
*                returns 400 if user is not found.
*/
UserController.getOneUser = (req, res, next) => {
  if (!req.params.id) return res.status(400).send({ err: 'Invalid request' });

  const query = {
    text: "SELECT * FROM \"Users\" WHERE user_id=$1",
    values: [req.params.id]
  };

  db.conn.one(query)
    .then(foundUser => res.status(200).send(foundUser))
    .catch(err => res.status(400).send(err));

};

/**
* Update User
* @param {id} - required, varchar, unique - should match a user ID in table
* @argument - optional, varchar - equates to the most recent post id 
*             associated with the user.  Used when getting post metadata.
* @description - updates user row in Users table if matching user_id is found.
*                returns updated user info.
*/
UserController.updateOneUser = (req, res, next) => {
  if (!req.params.id) return res.status(400).send({ err: 'Invalid request' });
  
  const updateUser = new User(req.params.id, req.body.recent_post_id);

  const query = {
    text: "UPDATE \"Users\" SET recent_post_id=$2 WHERE user_id=$1 RETURNING *",
    values: Object.values(updateUser)
  };

  db.conn.one(query)
    .then(updatedUser => res.status(200).send(updatedUser))
    .catch(err => res.status(400).send(err));
};

/**
* Remove User
* @param {id} - required, varchar, unique - should match a user ID in table
* @description - deletes user row in Users table if matching user_id is found.
*/
UserController.removeOneUser = (req, res, next) => {
  if (!req.params.id) return res.status(400).send({ err: 'Invalid request' });

  const query = {
    text: "DELETE FROM \"Users\" WHERE user_id=$1",
    values: [req.params.id]
  };

  db.conn.any(query)
    .then(deletedUser => {
      res.status(200).send({
        'msg': 'user successfully deleted'
      })
    })
    .catch(err => res.status(404).send(err));
};

module.exports = UserController;
