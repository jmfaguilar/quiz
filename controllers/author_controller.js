// GET /author
exports.author = function(req, res) {
	res.render('author/author', {autor: 'José Manuel Flores Aguilar', errors: []});
};
