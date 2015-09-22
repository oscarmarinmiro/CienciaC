__author__ = '@oscarmarinmiro @ @outliers_es'

# Django specific settings
import os
import sys
sys.path.append("../CienciaC/")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

# Import your models for use in your script
from models import *

# Start of application script (demo code below)

sample_user = Users.objects.all()

