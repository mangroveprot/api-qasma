import { Router } from 'express';
import { AppointmentController } from '../controllers';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
} from '../../../common/shared';
import {
  acceptAppointmentSchema,
  appointmentSchema,
  cancelAppointmentSchema,
  updateAppointmentSchema,
  verifyAppointmentSchema,
} from '../validation';
import { Role } from '../../users';

const router = Router();

router.post(
  '/',
  authenticateAndAttachUserContext,
  validate(appointmentSchema),
  authorizeRoles(Role.Student, Role.Staff, Role.Counselor),
  AppointmentController.createAppointment,
);

router.get(
  '/getAllByUser/:studentId',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student),
  AppointmentController.getAllAppointmentByUser,
);

router.get(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  AppointmentController.getAllAppointments,
);

router.get(
  '/sync/:lastSynced/:idNumber?',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  AppointmentController.sync,
);

router.get(
  '/slots/:duration',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  AppointmentController.getSlots,
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
  validate(acceptAppointmentSchema),
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
