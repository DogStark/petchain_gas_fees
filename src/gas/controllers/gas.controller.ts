@Controller('gas')
@UseInterceptors(GasCacheInterceptor)
export class GasController {
  @Get('current')
  @CacheKey('gas_current')
  async getCurrent() {
    // ...
  }
}

function CacheKey(arg0: string): (target: GasController, propertyKey: "getCurrent", descriptor: TypedPropertyDescriptor<() => Promise<void>>) => void | TypedPropertyDescriptor<...> {
    throw new Error("Function not implemented.");
}
function UseInterceptors(GasCacheInterceptor: any): (target: typeof GasController) => void | typeof GasController {
    throw new Error("Function not implemented.");
}

