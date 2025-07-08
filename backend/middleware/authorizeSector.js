// backend/middleware/authorizeSector.js
function authorizeSector(allowedSectors) {
    return (req, res, next) => {
        const userSector = req.user?.sector;
        if (userSector === 'DEV') return next();
        if (Array.isArray(allowedSectors)) {
            if (allowedSectors.includes(userSector)) return next();
        } else if (typeof allowedSectors === 'string') {
            if (allowedSectors === userSector) return next();
        }
        return res.status(403).json({ message: 'Acesso negado' });
    };
}

module.exports = authorizeSector;
