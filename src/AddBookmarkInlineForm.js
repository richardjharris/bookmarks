import React, { PureComponent } from 'react';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

class AddBookmarkInlineForm extends PureComponent {
  handleSubmit = (values, actions) => {
    this.props.onSubmit(values).then(() => {
       // Accepted
       actions.setSubmitting(false);
       actions.resetForm();
    })
    .catch(error => {
      actions.setSubmitting(false);
      actions.setErrors(error);
      // actions.setStatus({ msg: 'Some arbitrary data });
    });
  }

  TAG_MESSAGE = 'Must be space-separated tags using only letters, numbers and underscores.';

  SCHEMA = yup.object().shape({
    url: yup.string().url('Not a valid URL').required(),
    title: yup.string().required(),
    tags: yup.string().lowercase()
      .matches(/^\s*\w+(\s*\w+)*?\s*$/, { message: this.TAG_MESSAGE }),
    notes: yup.string(),
  });

  render() {
    const TextInput = ({ field: { name, ...field }, form, ...props }) => {
      const hasError = form.touched[name] && form.errors[name];
      const niceName = name.charAt(0).toUpperCase() + name.slice(1);
      const className = hasError ? 'error' : '';
      return (<>
        <Field type="text" name={name} placeholder={niceName} className={className}
          {...field} {...props} autoComplete="off" />
        {hasError && <span className="error-message">{form.errors[name]}</span>}
        </>
      );
    };

    return (<Formik
      initialValues={{ url: '', title: '', tags: '', notes: '' }}
      validationSchema={this.SCHEMA}
      onSubmit={this.handleSubmit}
    >
    {({ isSubmitting }) => (
      <Form className="bookmarkForm">
        <Field name="url" component={TextInput} />
        <Field name="title" component={TextInput} />
        <Field name="notes" component={TextInput} />
        <Field name="tags" component={TextInput} />
        <button type="submit" disabled={isSubmitting}>
          Add Bookmark
        </button>
      </Form>
    )}
    </Formik>);
  }
}

export default AddBookmarkInlineForm;