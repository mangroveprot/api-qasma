import { Router } from 'express';
import { AppointmentController } from '../controllers';

const router = Router();

router.post('/create', AppointmentController.createAppointment);
router.get('/getAll', AppointmentController.getAllAppointments);
router.get('/getById/:appointmentId', AppointmentController.getAppointmentById);

export default router;
