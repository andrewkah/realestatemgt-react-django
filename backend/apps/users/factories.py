import factory
from django.contrib.auth.models import Group

from apps.users.models import Agent, Profile, User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")
    is_active = True
    is_verified = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "strongpass")
        return model_class.objects.create_user(password=password, **kwargs)


class ProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Profile
        django_get_or_create = ("user",)

    user = factory.SubFactory(UserFactory)
    first_name = "John"
    last_name = "Doe"
    phone = "0778463728"
    role = "agent"


class AgentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Agent

    profile = factory.SubFactory(ProfileFactory, role="agent")


class GroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Group

    name = "Buyer"
