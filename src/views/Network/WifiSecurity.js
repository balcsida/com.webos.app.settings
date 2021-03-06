import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import $L from '@enact/i18n/$L';

import CheckboxItem from '@enact/moonstone/CheckboxItem';
import Button from '@enact/moonstone/Button';
import {MarqueeText} from '@enact/moonstone/Marquee';
import Input from '@enact/moonstone/Input';

import {connectingWifi, connectingAp} from '../../actions/networkAction';
import {removePath} from '../../actions';
import css from './WifiSecurity.less';
import SecurityValidate from './SecurityValidate';

class CustomInput extends React.Component {
	componentDidMount () {
		const inputComponent = document.querySelector("[data-component-id='myInput'");
		if (inputComponent) {
			const inputTag = inputComponent.querySelector('input');
			inputTag.click();
		}
	}

	render () {
		const {...rest} = this.props;
		return (
			<Input data-component-id="myInput" {...rest} />
		);
	}
}

class WifiSecurity extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			password: '',
			showPassword: false,
			valid: false
		};
		this.onInputChange = this.onInputChange.bind(this);
		this.onShowPasswordToggle = this.onShowPasswordToggle.bind(this);
		this.onConnectClick = this.onConnectClick.bind(this);
	}

	onShowPasswordToggle () {
		this.setState({
			showPassword: !this.state.showPassword
		});
	}

	onInputChange (event) {
		this.setState({
			password: event.value,
			valid: SecurityValidate.isValidPasskey(this.props.network.securityType, event.value)
		});
	}

	onConnectClick () {
		let params = {
			ssid: this.props.network.ssid,
			security: {
				securityType: this.props.network.securityType,
				simpleSecurity: {
					passKey: this.state.password
				}
			}
		};
		this.props.connectingAp(params);
		this.props.connectingWifi(params);
		this.props.removePath();
	}

	handleOnkeyUp = (ev) => {
		if (ev.keyCode === 13 && ev.target.tagName === 'INPUT' && this.state.valid) {
			ev.target.blur();
			this.onConnectClick();
		}
	}

	passwordInputProps () {
		return {
			onChange: this.onInputChange,
			onKeyUp: this.handleOnkeyUp,
			type: this.state.showPassword ? 'text' : 'password',
			dismissOnEnter: true,
			value: this.state.password
		};
	}

	showPasswordProps () {
		return {
			onClick: this.onShowPasswordToggle,
			selected: this.state.showPassword,
			children: $L('Show Password')
		};
	}

	connectButtonProps () {
		return {
			small: true,
			onClick: this.onConnectClick,
			disabled: !this.state.valid,
			children: $L('Connect')
		};
	}

	render () {
		const passwordInputProps = this.passwordInputProps();
		const showPasswordProps = this.showPasswordProps();
		const connectButtonProps = this.connectButtonProps();

		return (
			<div>
				<div className={css.row}>
					<MarqueeText className={css.label} marqueeOn={'render'}>
						{$L('Network')}
					</MarqueeText>
					<MarqueeText data-component-id={'wifiSsid'} className={css.item} marqueeOn={'render'}>{this.props.network.displayName || this.props.network.ssid}</MarqueeText>
				</div>
				<div className={css.row}>
					<MarqueeText className={css.label}>
						{$L('Password')}
					</MarqueeText>
					<div className={css.item}>
						<CustomInput {...passwordInputProps} data-component-id="passwordInput" />
					</div>
				</div>
				<CheckboxItem {...showPasswordProps} />
				<div className={css.center}>
					<Button data-component-id={'wifiConnectBtn'} {...connectButtonProps} />
				</div>
			</div>
		);
	}
}

WifiSecurity.propTypes = {
	connectingAp: PropTypes.func,
	connectingWifi: PropTypes.func,
	network: PropTypes.object,
	removePath: PropTypes.func
};

const mapStateToProps = (state) => ({
	network: state.network.connectingWifiNetwork
});

const mapDispatchToProps = (dispatch) => ({
	connectingWifi (params) {
		dispatch(connectingWifi(params));
	},
	removePath () {
		dispatch(removePath());
	},
	connectingAp (params) {
		dispatch(connectingAp(params));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(WifiSecurity);
