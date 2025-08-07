'use client'

import React from 'react';

import { ComboBox } from './ComboBox';
import type { ComboBoxProps } from './ComboBox';

// Default export wrapper for dynamic imports
const ComboBoxDefault: React.FC<ComboBoxProps> = (props) => {
    return <ComboBox {...props} />;
};

export default ComboBoxDefault;

