import random
from time import timezone
from django.core.mail import EmailMessage
from .models import Agent, User, OneTimePassword
from django.conf import settings
from django.db.models import F, Count

from apps.users import models


def generateOtp():
    otp = ""
    for i in range(6):
        otp += str(random.randint(1, 9))
    return otp


def send_otp_to_user(email):
    Subject = "One Time passcode for email verfication"
    otp_code = generateOtp()
    print(otp_code)
    user = User.objects.get(email=email)
    current_site = "myAuth.com"
    email_body = f"Hi {user.username}, Thanks for signing up on {current_site}. \nPlease verify with the one time password: {otp_code}"
    from_email = settings.DEFAULT_FROM_EMAIL

    OneTimePassword.objects.create(user=user, otp=otp_code)
    send_email = EmailMessage(
        subject=Subject, body=email_body, from_email=from_email, to=[email]
    )
    send_email.send(fail_silently=True)


def send_normal_email(data):
    email = EmailMessage(
        subject=data["email_subject"],
        body=data["email_body"],
        from_email=settings.EMAIL_HOST_USER,
        to=[data["to_email"]],
    )
    email.send()


"""
LEAD ASSIGNMENT
Method 1: It uses Round Robin technique to assign Agents to potential leads by distributing them evenly in a sequence. """
def round_robin_agent_assignment(lead):
    try:
        agent = (
            Agent.objects.filter(is_active=True)
            .order_by(F("last_assigned_at").asc(nulls_first=True))
            .first()
        )
        if agent:
            lead.assigned_agent = agent
            lead.save()
            agent.last_assigned_at = timezone.now()
            agent.total_leads += 1
            agent.save()
        return agent
    except Exception as e:
        print(f"Error in round robin assignment: {e}")
        return None

'''
Method 2: It checks for the Agents with the lowest number of assigned leads and assigns the lead to that agent'''
def load_balanced_assignment(lead):
    try:
        agent = (
            Agent.objects.filter(is_active=True)
            .annotate(
                active_leads_count=Count("lead", filter=models.Q(lead__is_active=True))
            )
            .order_by("active_leads_count")
            .first()
        )

        if agent:
            lead.assigned_agent = agent
            lead.save()
            agent.total_leads += 1
            agent.save()
        return agent
    except Exception as e:
        print(f"Error in load balanced assignment: {e}")
        return None

'''
Method 3: It assigns the Agent based on their specialisation and priority. '''
def skill_based_assignment(lead):
    try:
        specialisation_needed = lead.property_type if hasattr(lead, "property_type") else None
        agent = (
            Agent.objects.filter(is_active=True, specialisation=specialisation_needed)
            .order_by("-priority_level", "total_leads")
            .first()
        )

        if agent:
            lead.assigned_agent = agent
            lead.save()
            agent.total_leads += 1
            agent.save()
        return agent
    except Exception as e:
        print(f"Error in skill based assignment: {e}")
        return None