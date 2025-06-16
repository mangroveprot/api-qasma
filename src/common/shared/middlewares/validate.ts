import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';

// can take multiple schema
export const validate = (...schemas: ObjectSchema[]) => {
  const combinedSchema = schemas.reduce((acc, schema) => acc.concat(schema));

  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = combinedSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const formattedErrors = error.details.map((d) =>
        d.message.replace(/\"/g, ''),
      );

      res.status(400).json({
        success: false,
        message: 'Validation error',
        details: formattedErrors,
      });
      return;
    }

    next();
  };
};
