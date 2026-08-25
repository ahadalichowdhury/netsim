---
name: Network Automation
description: NetDevOps — Ansible, Terraform, programmable infrastructure
category: Advanced Networking
order: 52
---

## Step 1: Config as Code

**Configuration as Code** stores all network device configs in a **Git repository**.

Instead of manually logging into devices and typing commands:
• Every config change is a **Git commit**
• Changes are **reviewed** via pull requests
• History is **versioned** — easy rollback
• Configs are **auditable** — who changed what, when

This is the foundation of **NetDevOps**.

## Step 2: CI/CD for Networks

**CI/CD pipelines** automate testing and deployment of network configs:

1. Engineer pushes config change to Git
2. **CI pipeline** runs:
   - Syntax validation (linting)
   - Compliance checks
   - Dry-run against test environment
3. **CD pipeline** deploys to production after approval

This catches errors **before** they reach production devices.

## Step 3: Ansible

**Ansible** is a push-based automation tool using **YAML playbooks**.

Key characteristics:
• **Idempotent** — running the same playbook twice produces the same result
• **Agentless** — uses SSH/NETCONF, no software on devices
• **Push-based** — controller pushes configs to devices
• **Declarative** — describe the desired state, Ansible makes it happen

Ansible is ideal for **configuration management** — ensuring devices stay in the desired state.

## Step 4: Terraform

**Terraform** is a declarative Infrastructure as Code (IaC) tool.

Key differences from Ansible:
• **Declarative** — describe what you want, not how to get there
• **State management** — tracks what exists vs what's desired
• **Multi-vendor** — works with AWS, Azure, VMware, and network devices
• **Plan/Apply** — preview changes before applying

Terraform excels at **infrastructure provisioning** — creating and destroying resources.
