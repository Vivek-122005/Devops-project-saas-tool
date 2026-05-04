locals {
  name_prefix = var.project_name

  alb_subnet_ids = slice(
    sort(tolist(data.aws_subnets.default.ids)),
    0,
    min(2, length(data.aws_subnets.default.ids))
  )

  frontend_url = "http://${aws_lb.app.dns_name},http://localhost:5173,http://127.0.0.1:5173"

  log_configuration = {
    logDriver = "awslogs"
    options = {
      "awslogs-group"         = aws_cloudwatch_log_group.app.name
      "awslogs-region"        = var.aws_region
      "awslogs-stream-prefix" = "ecs"
    }
  }

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = var.container_image
      essential = true
      portMappings = [
        {
          containerPort = var.backend_port
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "BACKEND_PORT", value = tostring(var.backend_port) },
        { name = "NODE_ENV", value = "production" },
        { name = "DATABASE_URL", value = "file:./dev.db" },
        { name = "FRONTEND_URL", value = local.frontend_url }
      ]
      logConfiguration = local.log_configuration
    }
  ])
}