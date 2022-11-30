import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Stack } from 'react-bootstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { validationSchema, updateUserFormFields } from '../../../../helpers/forms/UpdateUserFormHelpers';
import Form from '../../../shared_components/forms/Form';
import FormControl from '../../../shared_components/forms/FormControl';
import useUpdateUser from '../../../../hooks/mutations/users/useUpdateUser';
import Spinner from '../../../shared_components/utilities/Spinner';
import { useAuth } from '../../../../contexts/auth/AuthProvider';
import useRoles from '../../../../hooks/queries/admin/roles/useRoles';
import FormSelect from '../../../shared_components/forms/controls/FormSelect';
import Option from '../../../shared_components/utilities/Option';

export default function UpdateUserForm({ user }) {
  const { t } = useTranslation();

  // TODO: Make LOCALES a context that provides the available languages and their native names in the client app.
  const LOCALES = {
    cs: 'Čeština',
    de: 'Deutsch',
    el_GR: 'ελληνικά',
    en: 'English',
    fa_IR: 'فارسی',
    fr: 'Français',
    hu_HU: 'magyar',
    ru: 'русский',
    tr: 'Türkçe',
  };

  const methods = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      language: user?.language,
      role_id: user?.role?.id,
    },
    resolver: yupResolver(validationSchema),
  });

  const { formState: { isSubmitting } } = methods;
  const updateUser = useUpdateUser(user?.id);
  const fields = updateUserFormFields;
  const currentUser = useAuth();

  const isAdmin = currentUser.permissions.ManageUsers === 'true';
  const { data: roles } = useRoles('', isAdmin);

  return (
    <Form methods={methods} onSubmit={updateUser.mutate}>
      <FormControl field={fields.name} type="text" />
      <FormControl field={fields.email} type="email" />
      <FormSelect field={fields.language}>
        {
          Object.keys(LOCALES).map((code) => <Option key={code} value={code}>{LOCALES[code]}</Option>)
        }
      </FormSelect>
      {(isAdmin && roles) && (
        <FormSelect field={fields.role_id}>
          {
            roles.map((role) => <Option key={role.id} value={role.id}>{role.name}</Option>)
          }
        </FormSelect>
      )}

      <Stack direction="horizontal" gap={2} className="float-end">
        <Button
          variant="neutral"
          onClick={() => methods.reset({
            name: user.name,
            email: user.email,
            language: user.language,
            role_id: user.role.id,
          })}
        >
          Cancel
        </Button>
        <Button variant="brand" type="submit" disabled={isSubmitting}>
          { t('update') }
          {updateUser.isLoading && <Spinner className="me-2" />}
        </Button>
      </Stack>
    </Form>
  );
}

UpdateUserForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    role: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    }).isRequired,
    language: PropTypes.string.isRequired,
  }).isRequired,
};
