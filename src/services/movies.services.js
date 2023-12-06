//1
const { Op } = require('sequelize');
const db = require('../database/models');
const createError = require('http-errors')


const getAllMovies = async (limit, offset, keyword) => {

    const options = keyword
    ? {
        where : {
            title: {
                [Op.substring]: keyword
            },

        },
    }
    : null;

    try {
        const movies = await db.Movie.findAll({
            limit, //cantidad de elementos que quiero que me devuelvaa
            offset, // cantidad de saltos
            attributes: {
                exclude: ['created_At', 'update_At', 'genre_id']
            },
            include: [{
                association: 'genre',
                attributes: ['id', 'name']
            },
            {
                association: 'actors',
                attributes: ['id', 'first_name', 'last_name']
            }
            ],
            ...options
        })

        const total = await db.Movie.count({
            ...options
        });

        return {
            movies,
            total
        }

    } catch (error) {
        console.log(error);
        throw {
            status: 500,
            message: error.message

        }
    }
};

const getMovieById = async (id) => {

    try {

        if (!id) throw createError(400, 'ID inexistente')

        const movie = await db.Movie.findByPk(id, {
            attributes: {
                exclude: ['created_at', 'updated_at', 'genre_id']
            },
            include: [

                {
                    association: 'genre',
                    attributes: ['id', 'name']
                },
                {
                    association: 'actors',
                    attributes: ['id', 'first_name', 'last_name'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })

        if (!movie) throw createError(404, 'No existe una pelicula con ese ID')

        return movie
    } catch (error) {
        console.log(error);
        throw {
            status: error.status || 500,
            message: error.message || 'Upss,hubo un error'
        }
    }
}

const createMovie = async (dataMovie, actors) => {
    try {
        const newMovie = await db.Movie.create(dataMovie)
        if (actors.length) {
            const actorsDB = actors.map(actor => {
                return {
                    movie_id: newMovie.id,
                    actor_id: actor
                }
            })
            await db.Actor_Movie.bulkCreate(actorsDB, {
                validate: true
            })
        }
        return newMovie

    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || 'Upss,hubo un error'
        }
    }
}





const updateMovie = async (id, dataMovie) => {
    try {
        const movie = await db.Movie.findByPk(id, {
            include: ['actors']
        })

    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || 'Upss,hubo un error'
        }
    }
}


module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie
}