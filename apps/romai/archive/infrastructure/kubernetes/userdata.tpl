#!/bin/bash
# EKS Node UserData Script
# This script configures EKS worker nodes during launch

set -o xtrace
/etc/eks/bootstrap.sh ${cluster_name} ${bootstrap_arguments}
