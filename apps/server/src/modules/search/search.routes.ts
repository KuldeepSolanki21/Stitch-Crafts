import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

router.get('/', (req, res) => searchController.handle(req, res));

export default router;
