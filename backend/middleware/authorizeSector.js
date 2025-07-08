module.exports = function authorizeSector(allowedSectors) {
    return (req, res, next) => {
        const userSector = req.user.sector;
        if (userSector === 'DEV') return next(); // DEV acesso master
        if (Array.isArray(allowedSectors) && allowedSectors.includes(userSector)) {
            return next();
        }
        return res.status(403).json({ message: 'Acesso negado' });
    };
};
