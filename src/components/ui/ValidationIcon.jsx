import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle } from 'lucide-react';

const ValidationIcon = ({ isValid }) => {
  return isValid ? (
    <CheckCircle className="w-4 h-4 text-green-500" />
  ) : (
    <XCircle className="w-4 h-4 text-red-500" />
  );
};

ValidationIcon.propTypes = {
  isValid: PropTypes.bool.isRequired
};

export default ValidationIcon;