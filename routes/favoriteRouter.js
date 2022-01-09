const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) 
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    //('favorite.user')('favorite.campsites')?
    .populate('user') 
    .populate('campsites')
    //favorite is the obj I return? 
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Check if Favorite Document for User Exists
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        // IF Favorite Document DOES exist
        if (favorite) {
            // For each object in req.body [{_id:string}....]
            req.body.forEach(rfav => {
                if (!favorite.campsites.includes(rfav._id)) {
                    favorite.campsites.push(rfav._id)
                }
                // Check if Favorite Document HAS req.body[object]
                // IF object exists, do nothing else add object to Favorite Document Array of IDs
            })         
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
            })
                .catch(err => next(err));
        //ELSE create Favorite Document and loop through body to add IDs to Facorte Document
        } else {
            Favorite.create({user: req.user._id })
            .then(favorite => {
                // IF Favorite Document DOES exist
                if (favorite) {
                    // For each object in req.body [{_id:string}....]
                    req.body.forEach(rfav => {
                        if (!favorite.campsites.includes(rfav._id)) {
                            favorite.campsites.push(rfav._id)
                        }
                        // Check if Favorite Document HAS req.body[object]
                        // IF object exists, do nothing else add object to Favorite Document Array of IDs
                    })         
                        favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                    })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
        }             
    })
    .catch (err => next(err))
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorite.findOneAndDelete({user:req.user._id})
        .then(favorite => {
            res.statusCode = 200;
            if(favorite) {
                res.setHeader("Content-Type", "application/json");
                res.json(favorite)
            }
            else {
                res.setHeader('Content-Type', "text/plain");
                res.end('No favorites found')
            }
        })
        .catch(err => next(err));
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) 
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(eq.params.campsiteId)
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader ("Content-Type", "application/json")
                    res.json(favorite)
                })
                .catch
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end('That campsite is already in the list of favorites!')
            }
        } else {
        Favorite.create({users: req.user._id, campsites: [req.params.campsiteId]})
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
        })
        .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})

// let remove = favorite.campsites.indexOf(req.params.campsiteId)
// let removed = favorite.campsites.splice(remove, 1)
// console.log(removed)
// .save()
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
           favorite.campsites = favorite.campsites.filter(n => (n !== req.params.campsiteId))
           .save()
           .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end('You have nothing to delete!')
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;
