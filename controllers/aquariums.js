/**
 * Aquarium controllers
 * @author Najam Ul Saqib
 */

const Aquariums = require('../models/Aquariums');
const Clients = require('../models/Clients');

exports.get = async (req, res) => {
  try {
    let { _id } = req.user;
    let aquariums = await Aquariums.find({ admin: _id, deleted: false }).populate('client');
    res.json({ success: true, results: aquariums });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    let { aquariumId } = req.params;
    let aquariums = await Aquariums.findOne({ _id: aquariumId, deleted: false }).populate('client');

    if (!aquariums) {
      return res.json({ success: false, message: 'Aquarium not found' });
    }

    res.json({ success: true, results: aquariums });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    let { client } = req.body;
    let { _id } = req.user;
    let aquarium = await Aquariums.create({ ...req.body, admin: _id });
    aquarium = await Aquariums.populate(aquarium, {
      path: 'client',
    });
    await Clients.findByIdAndUpdate(client, {
      $push: {
        aquariums: aquarium._id,
      },
    });
    res.json({
      success: true,
      message: 'Aquarium created.',
      results: aquarium,
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
    let { aquariumId } = req.params;
    const aquarium = await Aquariums.findByIdAndUpdate(aquariumId, req.body, {
      new: true,
    }).populate('client');

    res.json({
      success: true,
      message: 'Aquarium updated.',
      results: aquarium,
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
    let { aquariumId } = req.params;
    const aquarium = await Aquariums.findByIdAndUpdate(
      aquariumId,
      { deleted: true },
      { new: true },
    );
    await Clients.findByIdAndUpdate(
      aquarium.client,
      {
        $pull: {
          aquariums: aquariumId,
        },
      },
      {
        new: true,
      },
    );
    res.json({
      success: true,
      message: 'Aquarium deleted.',
      results: aquarium,
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
