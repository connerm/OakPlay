var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');
var Facility = require('../models/facility');
var User = require('../models/user');

router.get('/facilities', User.isAuthenticated, function(req, res, next) {
    res.render('facilities', { message: req.flash('message') });
});

/* GET specific timetable */
router.get('/:facility/:num', User.isAuthenticated, function(req, res, next) {
    Facility.find({name:req.params.facility}, function(err, docs){
        if(docs == null){
            req.flash('message', "That facility doesn't exist!")
            res.redirect('/timetable/facilities');
        }else{
            var fac;
            for(var f in docs){
                if(docs[f].id == req.params.num){
                    fac = docs[f];
                    break;
                }
            }
            var desc;
            if(fac.name == 'Tennis' || fac.name == 'Squash') desc = 'Court';
            if(fac.name == 'Workout' || fac.name == 'Spin') desc = 'Room';
            Booking.find({facility:fac}, 'day timeslot').sort('timeslot').exec(function(err, fdoc){
                Booking.find({user: req.user._id, facility: fac}, 'day timeslot').sort('timeslot').exec(function(err, udoc){
                    res.render('timetable', {number: req.params.num, facilities: docs, message: req.flash('message'), fBookings: fdoc, uBookings: udoc, facility: fac, facilitydesc: desc});
                })
            })
        }
    });
});


router.get('/', function(req, res, next) {
    Booking.findOne({}, function(err, booking) {
        req.params.facility_id = booking.facility;
        next();
    });
}, printBookings);

router.get('/:facility_id', printBookings);

function printBookings(req, res) {
    Booking.find({ facility: req.params.facility_id }, function (err, bookings) {
        if(err)
            res.send(err);
        res.json(bookings);
    });
}

module.exports = router;