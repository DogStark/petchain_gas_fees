@WebSocketGateway()
export class GasEventsGateway {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private gasService: GasService
  ) {}

  @SubscribeMessage('block_update')
  async handleCacheInvalidation() {
    await this.cacheManager.del('gas_current');
    await this.cacheManager.del('gas_historical');
  }
}

function SubscribeMessage(arg0: string): (target: GasEventsGateway, propertyKey: "handleCacheInvalidation", descriptor: TypedPropertyDescriptor<() => Promise<void>>) => void | TypedPropertyDescriptor<...> {
    throw new Error("Function not implemented.");
}
