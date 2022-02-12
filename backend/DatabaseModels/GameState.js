const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    _id: String,
    clients: Array,
    IsAdvanced: Boolean,
    playerCount: Number,
    state: Object,
    activePlayer: Number,
    ActiveGroup: Array
},
{ retainKeyOrder: true, minimize: false }
);

module.exports = mongoose.model('Game', GameSchema);