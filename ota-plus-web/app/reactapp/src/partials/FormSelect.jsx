/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';

class FormSelect extends Component {
  constructor() {
    super();
    this.state = {
      showDropDown: false,
      selectedOptions: [],
    };
  }

  attachEventListener = () => {
    const self = this;
    const body = $('body');

    // eslint-disable-next-line no-underscore-dangle
    if ($._data(body[0], 'events') && $._data(body[0], 'events').click) {
      self.detachEventListener();
    } else {
      body.on('click', (e) => {
        if (e.target.className !== 'c-form__option '
          && e.target.className !== 'c-form__option c-form__option--selected') {
          self.toggleMenu();
        }
      });
    }
  };

  detachEventListener = () => {
    $('body').unbind('click');
  };

  clearField = () => {
    this.setState({
      showDropDown: false,
      selectedOptions: [],
    });
  };

  toggleMenu = (e) => {
    const { appendMenuToBodyTag } = this.props;
    const existContainer = document.getElementById('dropdown-render-container');

    if (existContainer) {
      existContainer.parentNode.removeChild(existContainer);
    }
    const { showDropDown } = this.state;
    this.setState(
      {
        showDropDown: !showDropDown,
      },
      () => {
        this.attachEventListener();
      },
    );

    if (appendMenuToBodyTag && e && e.target && e.target.className !== 'c-form__option') {
      this.appendSelectFieldsToBody(e);
    }
  };

  appendSelectFieldsToBody = (e) => {
    const {
      multiple = true,
      newVersion = false,
      options,
      id,
      visibleFieldsCount = options.length > 1 ? options.length : 2
    } = this.props;
    const { showDropDown, selectedOptions } = this.state;
    const renderContainer = document.createElement('div');
    const inputPosition = e.target.getBoundingClientRect();

    renderContainer.setAttribute('id', 'dropdown-render-container');
    document.body.appendChild(renderContainer);

    const selectFields = (
      <select
        size={visibleFieldsCount}
        style={{
          top: inputPosition.top + inputPosition.height,
          left: inputPosition.left,
          position: 'absolute',
          width: inputPosition.width,
          height: options.length > 1 ? 'auto' : '35px',
        }}
        className={`c-form__select ${newVersion ? 'new-form-select' : ''} ${newVersion && options.length > 3 ? 'custom-sb' : ''}`}
        multiple={multiple}
        id="dropdown"
      >
        {options.map((value, index) => {
          const selected = _.includes(selectedOptions, value);
          if (_.isObject(value)) {
            const option = value;
            return (
              <option
                disabled={option.disabled}
                key={index}
                onClick={this.selectOption.bind(this, option)}
                id={`${id}-${option.id}`}
                className={`c-form__option ${selected ? 'c-form__option--selected' : ''}`}
                value={option.value}
              >
                {option.text}
              </option>
            );
          }
          return (
            <option
              key={index}
              onClick={this.selectOption.bind(this, value)}
              id={`${id}-${value}`}
              className={`c-form__option ${selected ? 'c-form__option--selected' : ''}`}
              value={value}
            >
              {value}
            </option>
          );
        })}
      </select>
    );

    if (!showDropDown) {
      ReactDOM.render(selectFields, renderContainer);
    } else {
      renderContainer.innerHTML = '';
    }
  };

  selectOption = (value, e) => {
    const { appendMenuToBodyTag, multiple, onChange } = this.props;
    if (appendMenuToBodyTag) {
      e.target.classList.toggle('c-form__option--selected');
    }
    const { selectedOptions } = this.state;
    let options = selectedOptions;
    if (_.isArray(options)) {
      if (_.includes(options, value)) {
        options = _.without(options, value);
      } else {
        options.push(value);
      }
    }

    if (!multiple) {
      this.toggleMenu(e);
      this.setState({
        selectedOptions: value,
      });
      onChange(value);
    } else {
      this.setState({
        selectedOptions: options,
      });
      onChange(options);
    }
  };

  render() {
    const {
      newVersion = false,
      multiple = true,
      label,
      placeholder,
      options,
      id = '',
      inputWidth = '100%',
      wrapperWidth = '100%',
      defaultValue,
      appendMenuToBodyTag = false,
      visibleFieldsCount = options.length > 1 ? options.length : 2,
      name = '',
      onChange = null,
      disabled = false
    } = this.props;

    const { showDropDown, selectedOptions } = this.state;
    const inputValue = selectedOptions.id
      ? selectedOptions.id
      : selectedOptions.text
        ? selectedOptions.text
        : selectedOptions.length
          ? selectedOptions
          : defaultValue && defaultValue.length > 0
            ? defaultValue
            : '';
    return (
      <div className="c-form__wrapper" style={{ width: wrapperWidth }}>
        {label ? <label className="c-form__label">{label}</label> : null}
        <div className="c-form__relative-input">
          <input
            className={`c-form__input ${inputValue.length === 0 ? 'c-form__input--hide-caret' : ''}`}
            type="text"
            style={{ width: inputWidth }}
            value={inputValue}
            placeholder={placeholder}
            onClick={this.toggleMenu}
            onChange={onChange}
            id={id}
            autoComplete="off"
            name={name}
            disabled={disabled}
          />
          {!newVersion && inputValue.length ? (
            <i
              className="fa fa-check c-form__select-icon"
            />
          ) : <i className={`fa ${showDropDown ? 'fa-angle-up' : 'fa-angle-down'} c-form__select-icon`} />}
          {showDropDown && !appendMenuToBodyTag ? (
            <select
              size={visibleFieldsCount}
              style={{
                height: options.length > 1 ? 'auto' : '35px',
              }}
              className={`c-form__select ${newVersion ? 'new-form-select' : ''}`}
              multiple={multiple}
              id={`select-${id}`}
            >
              {options.map((value, index) => {
                const selected = _.includes(selectedOptions, value);
                if (_.isObject(value)) {
                  const option = value;
                  return (
                    <option
                      key={index}
                      onClick={this.selectOption.bind(this, option)}
                      id={`${id}-${option.id}`}
                      className={`c-form__option ${selected ? 'c-form__option--selected' : ''}`}
                      value={option.value}
                    >
                      {option.text}
                    </option>
                  );
                }
                return (
                  <option
                    key={index}
                    onClick={this.selectOption.bind(this, value)}
                    id={`${id}-${value}`}
                    className={`c-form__option ${selected ? 'c-form__option--selected' : ''}`}
                    value={value}
                  >
                    {value}
                  </option>
                );
              })}
            </select>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

FormSelect.propTypes = {
  newVersion: PropTypes.bool,
  multiple: PropTypes.bool,
  label: PropTypes.string,
  appendMenuToBodyTag: PropTypes.bool,
  placeholder: PropTypes.string,
  visibleFieldsCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string,
  options: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({
      text: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.string,
    }),
  ]).isRequired,
  onChange: PropTypes.func,
  inputWidth: PropTypes.string,
  wrapperWidth: PropTypes.string,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  name: PropTypes.string,
  disabled: PropTypes.bool
};

export default FormSelect;
