/**
 * @author Najam Ul Saqib
 */
const Checklists = require('../models/Checklists');

exports.get = async (req, res) => {
  try {
    let user = req.user;
    let { type } = req.query;
    const adminId = user.role === 'user' ? user.admin : user._id;
    let checklist = await Checklists.find({ admin: adminId, type });
    res.json({ success: true, results: checklist });
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
    if (req.file) {
      req.body.attachment = {
        url: req.file.path,
        type: req.file.mimetype.split('/')[0],
      };
    }

    let checklist = await Checklists.create({ ...req.body, admin: _id });
    res.json({ success: true, results: checklist, message: 'Checklist item created.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    let { itemId } = req.params;

    let { description, attachment } = req.body;

    if (description) {
      req.body.attachment = null;
    } else if (attachment) {
      req.body.description = null;
    }

    if (req.file) {
      req.body.attachment = {
        url: req.file.path,
        type: req.file.mimetype.split('/')[0],
      };
      req.body.description = null;
    }

    let checklist = await Checklists.findByIdAndUpdate(itemId, req.body, { new: true });
    res.json({ success: true, results: checklist, message: 'Checklist item updated.' });
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

    let checklist = await Checklists.findByIdAndDelete(itemId);
    res.json({ success: true, results: checklist, message: 'Checklist item deleted.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
