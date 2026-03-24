export class CreateIngressDto {
  ingress_name: string
  namespace: string
  host: string
  service_name: string
  service_port: number
}