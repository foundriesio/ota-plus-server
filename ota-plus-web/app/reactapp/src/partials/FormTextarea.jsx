import React, {Component} from 'react';

export default class FormTextarea extends Component {

    validateInput(e) {
        if (e.target.value.length > 0) {
            this.props.onValid ? this.props.onValid() : null;
        } else {
            this.props.onInvalid ? this.props.onInvalid() : null;
        }
    }

    componentDidMount() {
        const {previousValue, isEditable = true, defaultValue} = this.props;
        this.input.value =
            previousValue && previousValue.length ?
            previousValue :
            defaultValue && defaultValue.length ? defaultValue : '';
        !isEditable ? this.input.setAttribute('disabled', 'disabled') : null;
    }

    render() {
        const {
            title = '',
            name,
            placeholder = '',
            defaultValue,
            id, label = '',
            inputWidth = '100%',
            wrapperWidth = '100%',
            rows = 1
        } = this.props;
        return (
            <div className="c-form__relative-wrapper" style={{width: wrapperWidth}}>
                <label title={title} htmlFor={id} className="c-form__label">
                    {label || ''}
                </label>
                <div className="c-form__input-wrapper">
                    <textarea 
                        name={name} 
                        id={id} 
                        rows={rows}
                        ref={(input) => this.input = input}
                        style={{width: inputWidth}}
                        className="c-form__input"
                        onKeyUp={this.validateInput.bind(this)}
                        placeholder={placeholder || ''}>
                    </textarea>
                </div>
            </div>
        )
    }
};