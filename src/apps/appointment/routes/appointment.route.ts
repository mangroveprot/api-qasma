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
  authorizeRoles(Role.Student),
  AppointmentController.createAppointment,
);
router.get(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  AppointmentController.getAllAppointments,
);
router.get('/getById/:appointmentId', AppointmentController.getAppointmentById);
router.patch(
  '/update',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Staff, Role.Counselor),
  validate(updateAppointmentSchema),
  AppointmentController.updateAppointment,
);
router.patch(
  '/cancel',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Staff, Role.Counselor),
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
