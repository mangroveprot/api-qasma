import { Router } from 'express';
import { AppointmentController } from '../controllers';

const router = Router();

router.post('/create', AppointmentController.createAppointment);
router.get('/getAll', AppointmentController.getAllAppointments);
router.get('/getById/:appointmentId', AppointmentController.getAppointmentById);
router.put('/update', AppointmentController.updateAppointment);
router.patch('/cancel', AppointmentController.cancelAppointment);
router.put('/accept', AppointmentController.acceptAppointment);
router.put('/verify', AppointmentController.verifyAppointment);

export default router;
