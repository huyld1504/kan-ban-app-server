const Board = require('../models/board');
const Section = require('../models/section');
const Task = require('../models/task');

exports.create = async (req, res) => {
    try {
        const boardsCount = await Board.find().countDocuments();
        const board = await Board.create({
            user: req.user._id,
            position: boardsCount > 0 ? boardsCount : 0
        });
        res.status(201).json(board);
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.getAll = async (req, res) => {
    try {
        const boards = await Board.find({ user: req.user._id }).sort('-position');

        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.updatePosition = async (req, res) => {
    const { boards } = req.body;
    try {
        for (const key in boards.reverse()) {
            const board = boards[key];
            await Board.findByIdAndUpdate(
                board.id,
                { $set: { position: key } }
            )
        }
        res.status(200).json('Updated successfully');
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.getOne = async (req, res) => {
    const { boardId } = req.params;

    try {
        const board = await Board.findOne({ user: req.user._id, _id: boardId });

        if (!board) return res.status(404).json("Board Not Found");
        const sections = await Section.find({ board: boardId });

        for (const section of sections) {
            const tasks = await Task.find({ section: section.id }).populate('section').sort('-position');
            section._doc.tasks = tasks;
        }
        board._doc.sections = sections;

        res.status(200).json(board);
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.update = async (req, res) => {
    const { boardId } = req.params;
    const { title, description, favorite } = req.body;

    try {
        if (title === '') req.body.title = 'Untitled';
        if (description === '') req.body.description = 'Add desciption here';

        const currentBoard = await Board.findById(boardId);
        if (!currentBoard) return res.status(404).json("Board Not Found");

        if (favorite !== undefined && currentBoard.favorite !== favorite) {
            const favoritesCount = await Board.find({
                user: currentBoard.user,
                favorite: true,
                id: { $ne: boardId }
            }).sort('favoritePosition');
            if (favorite) {
                req.body.favoritePosition = favoritesCount.length > 0 ? favoritesCount.length : 0;
            } else {
                for (const key in favoritesCount) {
                    const element = favoritesCount[key];
                    await Board.findByIdAndUpdate(
                        element.id,
                        { $set: { favoritePosition: key } }
                    )
                }
            }
        }

        const board = await Board.findByIdAndUpdate(
            boardId,
            { $set: req.body }
        );
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Board.find({
            user: req.user._id,
            favorite: true
        })
            .sort('-favoritePosition');
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.updateFavoritePosition = async (req, res) => {
    const { boards } = req.body;
    try {
        for (const key in boards.reverse()) {
            const board = boards[key];
            await Board.findByIdAndUpdate(
                board.id,
                { $set: { favoritePosition: key } }
            )
        }
        res.status(200).json('Updated successfully');
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.delete = async (req, res) => {
    const {boardId} = req.params;

    try {
        const sections = await Section.find({board: boardId});

        for (const section of sections) {
           await Task.deleteMany({section: section.id})
        }
        await Section.deleteMany({board: boardId});

        const currentBoard = await Board.findById(boardId);
        if (!currentBoard) return res.status(404).json('Board Not Found');
        if (currentBoard.favorite) {
            const favoritesCount = await Board.find({
                user: currentBoard.user,
                favorite: true,
                id: { $ne: boardId }
            }).sort('favoritePosition');

            for (const key in favoritesCount) {
                const element = favoritesCount[key];
                await Board.findByIdAndUpdate(
                    element.id,
                    { $set: { favoritePosition: key } }
                )
            }
        }

        await Board.deleteOne({_id: boardId});
        const boards = await Board.find().sort('position');

        for (const key in boards) {
            const board = boards[key];
            await Board.findByIdAndUpdate(
                board.id,
                { $set: { position: key } }
            )
        }

        res.status(200).json('Deleted');
    } catch (error) {
        res.status(500).json(error);
    }
}
