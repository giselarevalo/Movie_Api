
const createError = require('http-errors')
const paginate = require('express-paginate')
const { getAllMovies, getMovieById, createMovie } = require('../services/movies.services');

//2
const moviesController = {

    list: async (req, res) => {

        try {
            const {keyword} = req.query;
            const { movies, total } = await getAllMovies(req.query.limit, req.skip ,keyword) // limit y offset
            const pagesCount = Math.ceil(total / req.query.limit) // me da las cantidad de paginas que tendre segun la cantidad de elementos
            const currentPage = req.query.page //numero de pagina actual
            const pages = paginate.getArrayPages(req)(pagesCount, pagesCount, currentPage) // un array de todas las paginas disponibles
            return res.status(200).json({
                ok: true,
                meta: {
                    total,
                    pagesCount,
                    currentPage,
                    pages,
                    
                },
                data: movies
            })
        } catch (error) {

            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                error: error.message || 'Upss, hubo un error :('
            })

        }

    },
    detail: async (req, res) => {
        try {
            const movie = await getMovieById(req.params.id);
            return res.status(200).json({
                ok: true,
                data: movie
            });
        } catch (error) {

            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                error: error.message || 'Upss, hubo un error :('
            })

        }
    },
    create: async (req, res) => {
        try {

            const { title, release_date, awards, rating, length, genre_id, actors } = req.body

            if ([title, release_date, awards, rating].includes('' || undefined)) {
                throw createError(400, 'Todos los campos title, release_date,awars y rating son obligatorios')
            }

            const newMovie = await createMovie(
                {
                    title,
                    release_date,
                    awards,
                    rating,
                    genre_id

                }, actors);
            return res.status(200).json({
                ok: true,
                msg: 'Pelicula creada con exito',
                url: `${req.protocol}://${req.get('host')}/api/v1/movies/${newMovie.id}`
            });

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                error: error.message || 'Upss, hubo un error :('
            })
        }
    },
    update: function (req, res) {
        let movieId = req.params.id;
        Movies.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: { id: movieId }
            })
            .then(() => {
                return res.redirect('/movies')
            })
            .catch(error => res.send(error))
    },
    destroy: function (req, res) {
        let movieId = req.params.id;
        Movies
            .destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
            .then(() => {
                return res.redirect('/movies')
            })
            .catch(error => res.send(error))
    }
}

module.exports = moviesController;