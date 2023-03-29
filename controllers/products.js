/**
 * @author Najam Ul Saqib
 */
const Products = require('../models/Products');

exports.getAll = async (req, res) => {
  try {
    let user = req.user;
    const adminId = user.role === 'user' ? user.admin : user._id;
    const page = +req.query.page || 1;
    const query = req.query.text;
    const limit = 10;
    const skip = limit * (page - 1);
    const searchQuery = query
      ? {
          name: { $regex: query, $options: 'i' },
          admin: adminId,
          deleted: false,
        }
      : {
          admin: adminId,
          deleted: false,
        };

    const totalProducts = await Products.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Products.find(searchQuery).skip(skip).limit(limit);
    res.json({
      success: true,
      totalPages,
      page,
      prev: page > 1 ? page - 1 : null,
      next: page < totalPages ? page + 1 : null,
      results: products,
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.get = async (req, res) => {
  try {
    let { itemId } = req.params;
    let product = await Products.findOne({ _id: itemId, deleted: false });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, results: product });
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
    let product = await Products.create({ ...req.body, admin: _id });
    res.json({ success: true, results: product, message: 'Product added.' });
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
    let product = await Products.findByIdAndUpdate(itemId, req.body, { new: true });
    res.json({ success: true, results: product, message: 'Product updated.' });
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
    let product = await Products.findByIdAndUpdate(itemId, { deleted: true }, { new: true });
    res.json({ success: true, results: product, message: 'Product deleted.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
