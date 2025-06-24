import { Router } from 'express';
import { AppointmentController } from '../controllers';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
} from '../../../common/shared';
import {
  appointmentSchema,
  cancelAppointmentSchema,
  updateAppointmentSchema,
  verifyAppointmentSchema,
} from '../validation';
import { Role } from '../../users';

const router = Router();

router.post(
  '/create',
  authenticateAndAttachUserContext,
  validate(appointmentSchema),
  AppointmentController.createAppointment,
);
router.get(
  '/getAll',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  AppointmentController.getAllAppointments,
);
router.get('/getById/:appointmentId', AppointmentController.getAppointmentById);
router.put(
  '/update',
  authenticateAndAttachUserContext,
  validate(updateAppointmentSchema),
  AppointmentController.updateAppointment,
);
router.patch(
  '/cancel',
  authenticateAndAttachUserContext,
  validate(cancelAppointmentSchema),
  AppointmentController.cancelAppointment,
);
router.put(
  '/accept',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Staff),
  validate(updateAppointmentSchema),
  AppointmentController.acceptAppointment,
);
router.put(
  '/verify',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor),
  validate(verifyAppointmentSchema),
  AppointmentController.verifyAppointment,
);

export default router;
