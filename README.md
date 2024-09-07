# Secure Password Generator

Browser extension to generate secure random passwords and QR codes.

<p align="center">
  <img alt="Preview" src="assets/preview.webp"/> <br/> <br/>
  <a alt="Firefox Add-ons" href="https://addons.mozilla.org/addon/secure-password-generator-2">
    <img src="https://img.shields.io/badge/Firefox Add--ons-orange.svg?style=for-the-badge"/>
  </a>⠀
    <a alt="Chrome Web Store" href="https://chrome.google.com/webstore/detail/kmekigbemdeoedipbfgjhmaodbgfhidc">
    <img src="https://img.shields.io/badge/Chrome Web Store-red.svg?style=for-the-badge"/>
  </a>⠀
    <a alt="Donate via PayPal" href="https://www.paypal.com/donate/?hosted_button_id=DNFCXHF8NF32Y">
    <img src="https://img.shields.io/badge/Donate-PayPal-blue.svg?style=for-the-badge"/>
  </a>
</p>

### Secure Random Password Generator

Generate cryptographically secure random passwords with customizable options.

Each time an option is modified, it is saved in the **session** storage. \
Items in the session storage area are stored in-memory and will not be persisted to disk.

Click the `Save options` button to save the options in the **local** storage. \
Items in the local storage area stored locally and cleared when the extension is removed.

The `password` input field is never stored in the local storage.

The UI and functionality is based on [`@mar-kolya\secure-password-generator`][spg].

### QR Code Generator

Generate a QR code given a `issuer`, `label` and `secret` value:

> otpauth://totp/ISSUER:LABEL?secret=SECRET&issuer=ISSUER

<p align="center">
  <img alt="Preview" src="assets/qrcode.webp"/>
</p>

1. If the `issuer` or `label` fields are empty, generates a QR code just for the text in the `secret` input field.
2. If `label` is an email and `secret` is empty, gets the [Gravatar profile image][gravatar] for the email address using sha256.
3. If all fields are provided, generates a QR code using the [`otpauth://totp/` URI scheme][kuf], for your [authentication app][auth].

The QR code input fields are never stored in the local storage.

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [license file](LICENSE) for details.

<!-- Reference Links -->
[spg]: https://github.com/mar-kolya/secure-password-generator
[kuf]: https://github.com/google/google-authenticator/wiki/Key-Uri-Format
[auth]: https://en.wikipedia.org/wiki/Authenticator
[gravatar]: https://docs.gravatar.com/api/avatars/images
