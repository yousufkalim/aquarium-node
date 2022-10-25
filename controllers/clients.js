/**
 * @author Najam Ul Saqib
 */
const Clients = require('../models/Clients');

exports.get = async (req, res) => {
  try {
    let { _id } = req.user;
    let clients = await Clients.find({ admin: _id, deleted: false }).populate('aquariums');
    res.json({
      success: true,
      results: clients,
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    let { clientId } = req.params;
    let client = await Clients.findOne({ _id: clientId, deleted: false }).populate('aquariums');
    if (!client) {
      return res.status(404).json({ success: true, message: 'Client not found.' });
    }
    res.json({ success: true, results: client });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    let { _id } = req.user;

    let client = await Clients.create({
      ...req.body,
      admin: _id,
    });

    res.json({
      success: true,
      results: client,
      message: 'Client created.',
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    let { clientId } = req.params;
    let client = await Clients.findByIdAndUpdate(clientId, req.body, { new: true });
    res.json({
      success: true,
      results: client,
      message: 'Client updated.',
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    let { clientId } = req.params;
    let client = await Clients.findByIdAndUpdate(clientId, { deleted: true }, { new: true });
    res.json({
      success: true,
      results: client,
      message: 'Client deleted.',
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
