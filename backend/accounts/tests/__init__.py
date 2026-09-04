"""DRF view-level serializer for the RegisterView bug: weak-password rejections
happen via AUTH_PASSWORD_VALIDATORS, which must run through the serializer's
password field. RegisterSerializer wires validators to both password fields.
"""
