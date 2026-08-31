from django.core.exceptions import ValidationError


class ComplexityValidator:
    """Require at least one uppercase letter, one lowercase letter and one digit."""

    def __init__(self, min_upper: int = 1, min_lower: int = 1, min_digit: int = 1):
        self.min_upper = min_upper
        self.min_lower = min_lower
        self.min_digit = min_digit

    def validate(self, password: str, user=None) -> None:
        if (
            sum(c.isupper() for c in password) < self.min_upper
            or sum(c.islower() for c in password) < self.min_lower
            or sum(c.isdigit() for c in password) < self.min_digit
        ):
            raise ValidationError(
                'Password must contain at least one uppercase letter, one lowercase letter and one digit.',
                code='password_no_complexity',
            )

    def get_help_text(self) -> str:
        return 'Your password must contain at least one uppercase letter, one lowercase letter and one digit.'
