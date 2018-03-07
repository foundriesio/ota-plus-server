import React, {Component} from 'react';

export default class FormInput extends Component {

    validateInput(e) {
        if (e.target.value.length > 0) {
            this.props.onValid();
        } else {
            this.props.onInvalid();
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
            showIcon = false,
            showInput = true,
            inDirector = false,
            inputWidth = '100%',
            wrapperWidth = '100%',
        } = this.props;
        return (
            <div className="c-form__relative-wrapper" style={{width: wrapperWidth}}>
                <label title={title} htmlFor={id} className="c-form__label">
                    {label || ''}
                    {showIcon ? <i className="c-form__icon fa fa-info"/> : ''}
                </label>
                {showInput ?
                    <div className="c-form__input-wrapper">
                        <input ref={(input) => this.input = input}
                               name={name}
                               id={id}
                               style={{width: inputWidth}}
                               className="c-form__input"
                               type="text"
                               onKeyUp={this.validateInput.bind(this)}
                               placeholder={placeholder || ''}/>
                        {inDirector ?
                            <div className="c-form__input--in-director">
                                <img src="/assets/img/icons/black/lock.svg" alt="Director" />
                            </div>
                            : ''
                        }
                    </div>
                    : ''
                }
            </div>
        )
    }
};