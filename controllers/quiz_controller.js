var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId).then(function (quiz) {
		if (quiz) { 
			req.quiz = quiz;
			next();
		} else { next(new Error('No existe quizId=' + quizId)); }
	}).catch(function (error) { next(error); });
};

// GET /quizes
exports.index = function(req, res, next) {
	models.Quiz.findAll().then(function (quizes) {
		res.render('quizes/index.ejs', { quizes: quizes });
	}).catch(function (error) { next(error); });
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show.ejs', { quiz: req.quiz });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer.ejs', { quiz: req.quiz, respuesta: resultado });
};

// GET /quizes/search
exports.search = function(req, res, next) {
	if (req.query.search) {
		var busqueda  = req.query.search.replace(" ", "%");
		models.Quiz.findAll({ where:["pregunta like ?", '%'+busqueda+'%'], order:'pregunta ASC' })
		.then(function (quizes) { res.render('quizes/search.ejs', { quizes: quizes }); })
		.catch(function (error) { next(error); });
	} else {
		models.Quiz.findAll().then(function (quizes){
			res.render('quizes/index.ejs', { quizes: quizes });
		}).catch(function (error) { next(error); });
	}
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(  //crea objeto quiz
		{ pregunta: "Pregunta", respuesta: "Respuesta" }	
	);
	res.render('quizes/new.ejs', { quiz: quiz });
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build(req.body.quiz);
	// guarda en la DB los campos pregunta y respuesta de quiz
	quiz.save({fields: ["pregunta", "respuesta"]}).then(function() {
		res.redirect('/quizes');
	})  // Redirección HTTP (URL relativo) a la lista de preguntas
};