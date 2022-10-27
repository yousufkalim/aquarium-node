const axios = require('axios');
const API_KEY = process.env.GOOGLE_API_KEY;
exports.address = async (req, res) => {
  try {
    let { text } = req.query;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${API_KEY}&input=${text}`;
    let results = await axios.get(url);

    let placeIds = results.data.predictions.map((i) => i.place_id);

    let places = placeIds.map((item) =>
      axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item}&fields=name%2Cformatted_address%2Cgeometry&key=${API_KEY}`,
      ),
    );

    places = (await Promise.all(places)).map((item) => item.data.result);

    places = places.map((item) => {
      return {
        name: item.name,
        ...item.geometry.location,
      };
    });

    res.json({ success: true, results: places });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// {street: String,
//       city: String,
//       country: String,
//       zip_code: String,
//       lat: Number,
//       lng: Number,}
