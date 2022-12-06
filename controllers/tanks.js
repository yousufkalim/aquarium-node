/**
 * User auth controllers
 * @author Najam Ul Saqib
 */
const Tanks = require('../models/Tanks');

// Get
exports.get = async (req, res) => {
  try {
    let { _id } = req.user;
    let tanks = await Tanks.find({ admin: _id });

    res.json({ success: true, tanks });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create - tank
exports.create = async (req, res) => {
  try {
    let { _id } = req.user;
    let tank = await Tanks.create({ ...req.body, admin: _id });
    res.json({ success: true, message: 'Tank details added.', results: tank });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    let { itemId } = req.params;

    let tank = await Tanks.findByIdAndUpdate(itemId, req.body, { new: true });

    res.json({ success: true, message: 'Tank details updated.', results: tank });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    let { itemId } = req.params;
    let tank = await Tanks.findByIdAndDelete(itemId);

    res.json({ success: true, message: 'Tank details deleted.', results: tank });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
